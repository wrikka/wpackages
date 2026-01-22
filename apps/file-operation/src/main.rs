use clap::{Parser, ValueEnum};
use std::cmp::Ordering;
use std::ffi::OsStr;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use walkdir::{DirEntry, WalkDir};

#[derive(Parser, Debug)]
#[command(name = "file-operation")]
#[command(about = "Non-interactive file tree/list utility", long_about = None)]
struct Cli {
	/// Root directory
	#[arg(default_value = ".")]
	root: PathBuf,

	/// Only show trees up to a certain depth
	#[arg(long = "max-depth")]
	max_depth: Option<usize>,

	/// Show hidden files
	#[arg(short = 'h', long = "hidden", default_value_t = false)]
	show_hidden: bool,

	/// Don't show hidden files
	#[arg(short = 'H', long = "no-hidden", default_value_t = false)]
	no_hidden: bool,

	/// Do not show the tree (flat list)
	#[arg(long = "no-tree", default_value_t = false)]
	no_tree: bool,

	/// Show the tree
	#[arg(long = "tree", default_value_t = false)]
	tree: bool,

	/// Only show folders
	#[arg(short = 'f', long = "only-folders", default_value_t = false)]
	only_folders: bool,

	/// Sort mode
	#[arg(long = "sort-by", value_enum, default_value_t = SortBy::Name)]
	sort_by: SortBy,
}

#[derive(Copy, Clone, Debug, ValueEnum)]
enum SortBy {
	Name,
	Size,
	Date,
	Type,
}

#[derive(Debug, Clone)]
struct Node {
	depth: usize,
	path: PathBuf,
	meta: Option<NodeMeta>,
}

#[derive(Debug, Clone)]
struct NodeMeta {
	size: u64,
	modified: Option<SystemTime>,
	ext: Option<String>,
}

fn main() {
	let cli = Cli::parse();

	let root = cli.root;
	let show_hidden = if cli.no_hidden { false } else { cli.show_hidden };
	let max_depth = cli.max_depth;
	let show_tree = if cli.tree { true } else { !cli.no_tree };

	if !root.exists() {
		eprintln!("Root not found: {}", root.display());
		std::process::exit(2);
	}

	let mut nodes = collect_nodes(&root, max_depth, show_hidden, cli.only_folders);
	sort_nodes(&mut nodes, cli.sort_by);
	print_nodes(&root, &nodes, show_tree);
}

fn is_hidden(entry: &DirEntry) -> bool {
	entry
		.file_name()
		.to_str()
		.is_some_and(|name| name.starts_with('.'))
}

fn collect_nodes(root: &Path, max_depth: Option<usize>, show_hidden: bool, only_folders: bool) -> Vec<Node> {
	let max_depth_walk = max_depth.unwrap_or(usize::MAX).saturating_add(1);
	let mut out: Vec<Node> = Vec::new();

	for entry in WalkDir::new(root)
		.follow_links(false)
		.min_depth(1)
		.max_depth(max_depth_walk)
		.into_iter()
	{
		let entry = match entry {
			Ok(v) => v,
			Err(_) => continue,
		};

		if !show_hidden && is_hidden(&entry) {
			continue;
		}

		let ft = match entry.file_type().is_dir() {
			true => true,
			false => false,
		};
		if only_folders && !ft {
			continue;
		}

		let depth = entry.depth();
		let path = entry.path().to_path_buf();
		let meta = entry.metadata().ok().map(|m| NodeMeta {
			size: m.len(),
			modified: m.modified().ok(),
			ext: path
				.extension()
				.and_then(OsStr::to_str)
				.map(|s| s.to_ascii_lowercase()),
		});

		out.push(Node {
			depth,
			path,
			meta,
		});
	}

	out
}

fn sort_nodes(nodes: &mut [Node], sort_by: SortBy) {
	nodes.sort_by(|a, b| {
		let depth_cmp = a.depth.cmp(&b.depth);
		if depth_cmp != Ordering::Equal {
			return depth_cmp;
		}

		let a_name = a.path.file_name().and_then(OsStr::to_str).unwrap_or("");
		let b_name = b.path.file_name().and_then(OsStr::to_str).unwrap_or("");

		match sort_by {
			SortBy::Name => a_name.to_ascii_lowercase().cmp(&b_name.to_ascii_lowercase()),
			SortBy::Size => {
				let a_size = a.meta.as_ref().map(|m| m.size).unwrap_or(0);
				let b_size = b.meta.as_ref().map(|m| m.size).unwrap_or(0);
				a_size.cmp(&b_size).then_with(|| a_name.cmp(b_name))
			}
			SortBy::Date => {
				let a_time = a.meta.as_ref().and_then(|m| m.modified).unwrap_or(SystemTime::UNIX_EPOCH);
				let b_time = b.meta.as_ref().and_then(|m| m.modified).unwrap_or(SystemTime::UNIX_EPOCH);
				a_time.cmp(&b_time).then_with(|| a_name.cmp(b_name))
			}
			SortBy::Type => {
				let a_ext = a.meta.as_ref().and_then(|m| m.ext.as_deref()).unwrap_or("");
				let b_ext = b.meta.as_ref().and_then(|m| m.ext.as_deref()).unwrap_or("");
				a_ext.cmp(b_ext).then_with(|| a_name.cmp(b_name))
			}
		}
	});
}

fn print_nodes(root: &Path, nodes: &[Node], show_tree: bool) {
	for node in nodes {
		let rel = node
			.path
			.strip_prefix(root)
			.ok()
			.unwrap_or(node.path.as_path());
		let name = rel.to_string_lossy();

		if show_tree {
			let indent = "  ".repeat(node.depth.saturating_sub(1));
			println!("{}{}", indent, name);
		} else {
			println!("{}", name);
		}
	}
}
