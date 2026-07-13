import { Box, Skeleton } from "@mui/material";
import { MainSkeletonVariants } from "../core/types/mainSkeletonVariants";

interface MainSkeletonProps {
  variant: MainSkeletonVariants;
}

const structures = {
  table: (
    <>
      <Skeleton
        variant="text"
        sx={{ fontSize: "1rem", width: 150 }}
      />
      <Skeleton
        variant="rounded"
        sx={{ width: "100%" }}
        height={75}
      />
      <Skeleton
        variant="rounded"
        sx={{ width: "100%" }}
        height={450}
      />
    </>
  ),
  form: (
    <>
      <Skeleton
        variant="text"
        sx={{ fontSize: "1rem", width: 150 }}
      />
      <Skeleton
        variant="rounded"
        sx={{ width: "100%" }}
        height={75}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton
          variant="rounded"
          sx={{ width: "75%" }}
          height={275}
        />
        <Skeleton
          variant="rounded"
          sx={{ width: "25%" }}
          height={275}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton
          variant="rounded"
          sx={{ width: "35%" }}
          height={300}
        />
        <Skeleton
          variant="rounded"
          sx={{ width: "65%" }}
          height={300}
        />
      </Box>
      <Skeleton width={250} height={50} variant="rounded"/>
    </>
  ),
};

export default function MainSkeleton({
  variant = "table",
}: Readonly<MainSkeletonProps>) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {structures[variant]}
    </Box>
  );
}
