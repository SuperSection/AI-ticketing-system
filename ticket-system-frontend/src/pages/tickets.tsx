import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Ticket } from "../types";
import { useAuthStore } from "../store";

interface TicketForm {
  title: string;
  description: string;
}

const Tickets = () => {
  const [form, setForm] = useState<TicketForm>({ title: "", description: "" });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        credentials: "include", // Send cookies for authentication
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        method: "GET",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        // Add the new ticket to the list immediately with the returned data
        if (data.ticket) {
          setTickets(prevTickets => [data.ticket, ...prevTickets]);
        } else {
          fetchTickets(); // Fallback to refresh list if ticket not returned
        }
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link
            key={ticket._id}
            className="card shadow-md p-4 bg-gray-800"
            to={ticket.ticketNumber ? `/tickets/${ticket.ticketNumber}` : "#"}
            onClick={(e) => {
              if (!ticket.ticketNumber) {
                e.preventDefault();
                alert("Ticket is still being processed. Please try again in a moment.");
              }
            }}
          >
            <h3 className="font-bold text-lg">{ticket.title}</h3>
            <p className="text-sm">{ticket.description}</p>
            {ticket.ticketNumber && (
              <p className="text-sm">Ticket #{ticket.ticketNumber}</p>
            )}
            <p className="text-sm text-gray-500">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </Link>
        ))}
        {tickets.length === 0 && <p>No tickets submitted yet.</p>}
      </div>
    </div>
  );
};

export default Tickets;
