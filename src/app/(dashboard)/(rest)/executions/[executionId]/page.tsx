interface PageProps {
  params: Promise<{
    executionId: string
  }>
}

const page = async ({ params }: PageProps) => {
  const { executionId } = await params
  return (
    <div>
      <p>Execution ID {executionId}</p>
    </div>
  )
}

export default page
