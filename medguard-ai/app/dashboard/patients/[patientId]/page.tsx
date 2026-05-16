import { PatientProfile } from "@/components/patients/patient-profile";

type PatientProfilePageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function PatientProfilePage({
  params,
}: PatientProfilePageProps) {
  const { patientId } = await params;

  return <PatientProfile patientId={patientId} />;
}
