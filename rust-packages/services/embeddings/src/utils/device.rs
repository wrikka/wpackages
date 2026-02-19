use candle_core::Device;

/// Creates a Candle device from an optional string identifier.
///
/// This function parses a string to determine which device (CPU or GPU) to use.
/// It supports identifiers like "cpu", "gpu", "cuda", and "metal".
/// If a GPU is requested, it attempts to initialize it. If the identifier is
/// invalid or not provided, it defaults to the CPU.
///
/// # Arguments
///
/// * `device_str` - An `Option<String>` containing the device identifier.
///
/// # Returns
///
/// A `Device` instance for the selected hardware.
pub fn get_device(device_str: Option<String>) -> Device {
    match device_str.as_deref() {
        Some("gpu") | Some("cuda") => {
            Device::cuda_if_available(0).unwrap_or(Device::Cpu)
        }
        Some("metal") => Device::metal_if_available(0).unwrap_or(Device::Cpu),
        _ => Device::Cpu,
    }
}
