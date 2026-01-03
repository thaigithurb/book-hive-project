import { useRouter } from "next/navigation";

interface TableActionsProps {
  actions: any[];
  source: string;
  slug: string;
  id: string;
  onDelete: (id: string) => void;
}

export default function TableActions({
  actions,
  source,
  slug,
  id,
  onDelete,
}: TableActionsProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            className={action.class}
            onClick={() => {
              router.push(`/admin/${source}/${action.title}/${slug}`);
            }}
          >
            {action.label}
          </button>
        ))}
        <button
          className="py-1 px-3 rounded-[6px] text-[13.6px] font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200 cursor-pointer"
          onClick={() => onDelete(id)}
        >
          Xóa
        </button>
      </div>
    </>
  );
}
