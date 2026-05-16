import { PatientProfile } from "@/components/patients/patient-profile";

type PatientWorkspacePageProps = {
  params: Promise<{
    patientId: string;
  }>;
};

export default async function PatientWorkspacePage({
  params,
}: PatientWorkspacePageProps) {
  const { patientId } = await params;

  return <PatientProfile patientId={patientId} />;
}
