import { Box, Skeleton } from "@mui/material";
export default function MainSkeleton() {
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
    </Box>
  );
}
