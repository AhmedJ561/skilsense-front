'use client'
import { useParams, useSearchParams } from 'next/navigation'
import InterviewStartup from './../InterviewStartup'

export default function Page() {
  const params = useParams()
  const searchParams = useSearchParams()

  let interviewId: string | undefined = params?.interviewId as string | undefined;
if (Array.isArray(interviewId)) {
  interviewId = interviewId[0] as string; // cast to string
} else {
  interviewId = interviewId;
}

  const isInterviewStarted = searchParams.get('StartInterview') === 'true'

  return (
    <>
      {isInterviewStarted && interviewId && (
        <InterviewStartup interviewId={interviewId} />
      )}
    </>
  )
}
