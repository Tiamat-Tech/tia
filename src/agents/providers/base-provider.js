/**
 * Base class for agent providers. Implement handle() in subclasses.
 */
export class BaseProvider {
  async handle() {
    throw new Error("BaseProvider.handle() not implemented");
  }
}

export default BaseProvider;
