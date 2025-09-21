import JobDetailPage from '@/app/components/job-detail'
import React from 'react'

const Page = async ({ params }) => {
  const { id } = await params
  return <JobDetailPage jobId={id} />
}

export default Page
