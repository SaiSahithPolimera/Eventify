import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AddTickets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'free',
    price: '0',
    quantity: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEventAndTickets();
  }, [id]);

  const fetchEventAndTickets = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
          credentials: 'include'
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}/tickets`, {
          credentials: 'include'
        })
      ]);

      const eventData = await eventRes.json();
      const ticketsData = await ticketsRes.json();

      if (eventData.success) {
        setEvent(eventData.event);
        
        if (user?.role !== 'organizer' || eventData.event.organizer_id !== user.id) {
          setError('You are not authorized to manage tickets for this event');
          return;
        }
      } else {
        setError(eventData.message || 'Failed to fetch event');
      }

      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        price: value === 'free' ? '0' : prev.price
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}/tickets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: formData.type,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity)
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchEventAndTickets();
        
        setFormData({
          type: 'free',
          price: '0',
          quantity: ''
        });
        setShowAddForm(false);
        setError(null);
      } else {
        if (data.errors) {
          const errors = {};
          data.errors.forEach(err => {
            errors[err.fieldName] = err.message;
          });
          setFormErrors(errors);
        } else {
          setError(data.message || 'Failed to add ticket');
        }
      }
    } catch (error) {
      console.error('Error adding ticket:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}/tickets/${ticketId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (data.success) {
        await fetchEventAndTickets();
      } else {
        setError(data.message || 'Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-rose-600 hover:text-rose-700 flex items-center mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-sans text-gray-900 mb-2">Manage Tickets</h1>
          {event && (
            <p className="text-gray-600">
              Add ticket types for: <span className="font-semibold">{event.title}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {tickets.length > 0 && !showAddForm && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Great! You've added {tickets.length} ticket type{tickets.length !== 1 ? 's' : ''}.</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Ticket Types</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add Ticket Type'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Ticket Type</h3>
            
            <form onSubmit={handleAddTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-rose-300">
                    <input
                      type="radio"
                      name="type"
                      value="free"
                      checked={formData.type === 'free'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center ${formData.type === 'free' ? 'text-rose-600' : 'text-gray-600'}`}>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Free</span>
                    </div>
                    {formData.type === 'free' && (
                      <div className="absolute inset-0 border-2 border-rose-500 rounded-lg"></div>
                    )}
                  </label>

                  <label className="relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-rose-300">
                    <input
                      type="radio"
                      name="type"
                      value="paid"
                      checked={formData.type === 'paid'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`flex items-center ${formData.type === 'paid' ? 'text-rose-600' : 'text-gray-600'}`}>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">Paid</span>
                    </div>
                    {formData.type === 'paid' && (
                      <div className="absolute inset-0 border-2 border-rose-500 rounded-lg"></div>
                    )}
                  </label>
                </div>
                {formErrors.type && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.type}</p>
                )}
              </div>

              {formData.type === 'paid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500 text-lg">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="e.g., 100"
                  required
                />
                {formErrors.quantity && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.quantity}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'Adding...' : 'Add Ticket Type'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tickets Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Add at least one ticket type to allow attendees to RSVP for your event.
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Add Your First Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    ticket.type === 'free' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-6 h-6 ${ticket.type === 'free' ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {ticket.type} Ticket
                    </h3>
                    <p className="text-sm text-gray-600">
                      {ticket.quantity} available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-rose-600">
                    {ticket.price === 0 ? 'Free' : `$${parseFloat(ticket.price).toFixed(2)}`}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete ticket type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleFinish}
                className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finish & View Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTickets;