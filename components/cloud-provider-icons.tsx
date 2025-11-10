import Image from "next/image"

export function AzureIcon({ className }: { className?: string }) {
  return <Image src="/icons/microsoft-azure.png" alt="Microsoft Azure" width={24} height={24} className={className} />
}

export function AWSIcon({ className }: { className?: string }) {
  return <Image src="/icons/amazon-aws.png" alt="Amazon Web Services" width={24} height={24} className={className} />
}

export function GoogleCloudIcon({ className }: { className?: string }) {
  return (
    <Image src="/icons/google-cloud.png" alt="Google Cloud Platform" width={24} height={24} className={className} />
  )
}
