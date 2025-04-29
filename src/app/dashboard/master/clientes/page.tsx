import ClientesContent from '@/components/ClientesContent'

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <ClientesContent searchParams={searchParams} />
}
