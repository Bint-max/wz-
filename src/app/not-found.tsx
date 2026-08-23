import Link from "next/link";

/**
 * 404 页面
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold">页面不存在</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        你访问的页面可能已被删除或从未存在。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        返回首页
      </Link>
    </div>
  );
}
