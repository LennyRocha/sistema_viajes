export default interface CampoConfig {
  clave: string;

  label: string;

  tipo: "string" | "number" | "boolean";

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

  defaultValue?: string | number | boolean;

  visible?: {
    campo: string;
    valor: string | number | boolean;
  };

  opciones?: string | number[];
}
