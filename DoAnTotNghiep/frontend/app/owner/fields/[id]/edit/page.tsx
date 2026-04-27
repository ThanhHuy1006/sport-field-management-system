import EditFieldFormClient from "./edit-field-form-client"

type EditFieldPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditFieldPage({ params }: EditFieldPageProps) {
  const { id } = await params

  return <EditFieldFormClient fieldId={id} />
}