interface PageProps {
  params: Promise<{
    credentialId: string
  }>
}

const page = async ({ params }: PageProps) => {
  const { credentialId } = await params
  return (
    <div>
      <p>Credential ID {credentialId}</p>
    </div>
  )
}

export default page
