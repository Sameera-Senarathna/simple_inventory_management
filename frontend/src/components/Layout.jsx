import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 overflow-y-auto pb-6">
        <Outlet />
      </main>
    </div>
  );
}
