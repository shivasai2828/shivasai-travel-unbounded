export const metadata = {
  title: "Admin — Enquiries — Travel Unbounded",
};

async function getEnquiries() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/enquiry`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return data.success ? data.data : [];
}

export default async function AdminPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Enquiries ({enquiries.length})</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Travel Date</th>
              <th className="py-2 pr-4">People</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Destination</th>
              <th className="py-2 pr-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e._id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{e.fullName}</td>
                <td className="py-2 pr-4">{e.fullPhone}</td>
                <td className="py-2 pr-4">{e.email}</td>
                <td className="py-2 pr-4">{e.travelDate}</td>
                <td className="py-2 pr-4">{e.numPeople}</td>
                <td className="py-2 pr-4">{e.hotelCategory}</td>
                <td className="py-2 pr-4 capitalize">{e.destination || "—"}</td>
                <td className="py-2 pr-4">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
