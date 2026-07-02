"use client";

import {
  Breadcrumb,
  CommonPageProps,
  FormButtonsRow,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import { ChevronLeft } from "@mui/icons-material";
import { TextField } from "@mui/material";
import { instituciones } from "../../data/constants";

interface NuevaInstitucionProps extends CommonPageProps {
  institucionId?: string;
}

export default function NuevaInstitucion({
  navigationFunction,
  snack,
  institucionId,
}: Readonly<NuevaInstitucionProps>) {
  const institucion = instituciones.find(
    (item) => String(item.id) === institucionId,
  );
  const isEditing = Boolean(institucionId);

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Instituciones", href: "/institutions" },
          {
            nombre: isEditing ? "Editar" : "Nuevo",
            href: isEditing
              ? `/institutions/editar/${institucionId}`
              : "/institutions/nuevo",
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title={isEditing ? "Editar institucion" : "Nueva institucion"}
        subtitle={
          isEditing
            ? "Actualiza los datos principales de la institucion"
            : "Registra una institucion para asociarla con unidades y servicios"
        }
        iconname={isEditing ? "edit" : "add"}
        showButton
        onButtonClick={() => navigationFunction("/institutions")}
        buttonTitle="Volver"
        leftIcon={<ChevronLeft />}
      />
      <PaperBlock
        title="Datos generales"
        subtitle="Captura la informacion basica de la institucion"
        contentWrapperSx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <TextField
          label="Nombre de la institucion *"
          variant="outlined"
          size="small"
          fullWidth
          defaultValue={institucion?.nombre}
        />
        <TextField
          label="Descripcion *"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={4}
          defaultValue={institucion?.descripcion}
        />
      </PaperBlock>
      <FormButtonsRow
        hasRequiredFields
        submitText="Guardar"
        resetText="Cancelar"
        onSubmitClick={() => {
          snack?.success({
            message: isEditing
              ? "Institucion actualizada"
              : "Institucion guardada",
          });
          navigationFunction("/institutions");
        }}
        onResetClick={() => navigationFunction("/institutions")}
      />
    </>
  );
}
