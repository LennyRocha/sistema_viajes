export default interface CampoConfig {
  clave: string;

  label: string;

  tipo: "text" | "number" | "boolean";

  inputTipo?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "select"
    | "radio"
    | "switch";

  requerido?: boolean;

  min?: number;

  max?: number;

  minLength?: number;

  maxLength?: number;

  regex?: RegExp;

  placeholder?: string;

  defaultValue?: unknown;

  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  opciones?: string | number[];
}
