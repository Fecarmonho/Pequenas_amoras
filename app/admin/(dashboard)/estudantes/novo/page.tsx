import StudentForm from "@/components/admin/StudentForm";

export default function NovoEstudantePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Novo estudante</h1>
      <StudentForm />
    </div>
  );
}
