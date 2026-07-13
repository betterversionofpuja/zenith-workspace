const FormMessage = ({ message }) => {
  if (!message) return null;

  return (
    <p className="rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  );
};

export default FormMessage;
