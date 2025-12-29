import { Node } from './node';

export class TreeNode<T> extends Node<T> {
  public left: TreeNode<T> | null;
  public right: TreeNode<T> | null;

  constructor(value: T) {
    super(value);
    this.left = null;
    this.right = null;
  }
}
