import { Skeleton } from "@/components/ui/skeleton";

export default function ParentPortalLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-3xl" />
      <Skeleton className="h-72 rounded-3xl" />
    </div>
  );
}
