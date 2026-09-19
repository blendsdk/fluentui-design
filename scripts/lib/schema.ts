import { Ajv2020 } from "ajv/dist/2020.js";
import ajvFormats from "ajv-formats";
import type { Schema } from "ajv";

/**
 * The `ajv-formats` plugin, resolved for the CommonJS/ESM boundary.
 *
 * The package ships CommonJS with a declared default export. Under Node's ESM
 * interop a default import yields the module object, so the plugin itself is
 * taken from that object's `default` property.
 */
const addFormats = ajvFormats.default;

/** A validation attempt that found no problems; `value` is the narrowed input. */
export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

/** A validation attempt that found one or more problems. */
export interface ValidationFailure {
  ok: false;
  errors: string[];
}

/** The result of validating one value against a JSON Schema. */
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * A reusable validator bound to a single compiled JSON Schema.
 *
 * The schema is compiled once (Ajv compilation is comparatively expensive) so a
 * validator can run over many entries efficiently.
 */
export interface SchemaValidator<T> {
  /**
   * Validate an unknown value against the compiled schema.
   *
   * @param data - The value to check.
   * @returns A success carrying the typed value, or a failure listing messages.
   */
  validate(data: unknown): ValidationResult<T>;
}

/**
 * Compile a JSON Schema (draft 2020-12) into a reusable validator.
 *
 * `ajv-formats` is registered so `format: "uri"` and `format: "date"` are
 * enforced. Validation collects every error instead of stopping at the first,
 * which makes a single failing catalog report all of its problems at once.
 *
 * @param schema - A JSON Schema document.
 * @param options - Optional settings; `name` is used only in error messages.
 * @returns A validator whose `validate` method narrows to `T` on success.
 *
 * @example
 * ```ts
 * const validator = createSchemaValidator<{ id: string }>(schema);
 * const result = validator.validate(parsed);
 * if (!result.ok) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function createSchemaValidator<T>(
  schema: Schema,
  options: { name?: string } = {},
): SchemaValidator<T> {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile<T>(schema);
  const label = options.name ?? "value";

  return {
    validate(data: unknown): ValidationResult<T> {
      if (validate(data)) {
        return { ok: true, value: data };
      }
      const errors = (validate.errors ?? []).map((issue) => {
        const path = issue.instancePath.length > 0 ? issue.instancePath : "/";
        const message = issue.message ?? "is invalid";
        return `${label}${path} ${message}`;
      });
      return { ok: false, errors };
    },
  };
}
