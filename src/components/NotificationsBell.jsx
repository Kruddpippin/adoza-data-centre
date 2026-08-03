import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useData";
import { formatDateTime } from "@/lib/utils";

export function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export function NotificationsBell() {
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications(user?.id);
  const markRead = useMarkNotificationsRead(user?.id);
  const { open, setOpen, ref } = useDropdown();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unread) markRead.mutate();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border bg-card p-1.5 shadow-lg" role="menu">
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notifications</p>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">Nothing yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg px-2.5 py-2 hover:bg-muted">
                <p className="text-xs font-semibold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.message}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formatDateTime(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
