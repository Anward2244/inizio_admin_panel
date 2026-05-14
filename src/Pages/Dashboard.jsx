import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { FiTrendingUp, FiUsers, FiBox, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Mock data metrics
  const metrics = [
    { title: "Total Revenue", value: "₹2,45,990", icon: FiDollarSign, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { title: "No of Brands", value: brands.length, icon: FiTrendingUp, color: "text-blue-400", bg: "bg-blue-500/20" },
    { title: "No of Products", value: products.length, icon: FiBox, color: "text-amber-400", bg: "bg-amber-500/20" },
    { title: "Total Users", value: users.length, icon: FiUsers, color: "text-indigo-400", bg: "bg-indigo-500/20" },
  ];

   useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const [productsResponse, brandsResponse, usersResponse] = await Promise.all([
          api.get('/products/', { headers }).catch(() => ({ data: [] })),
          api.get('/brands/', { headers }).catch(() => ({ data: [] })),
          api.get('/admin/customers', { headers }).catch(() => ({ data: [] }))
        ]);
        setUsers(usersResponse.data);
        setProducts(productsResponse.data);
        setBrands(brandsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // console.log(products)
  // console.log(brands)

  const usernav = (index) => {
    if(index ==1){
      navigate('/products/brands');
    }
    else if(index === 2){
      navigate('/products/list');
    }
    else if(index === 3) {
      navigate('/users/list');
    }
  }

  // Chart.js Data & Options
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Sales',
        data: [42000, 38000, 55000, 48000, 69000, 85000],
        borderColor: 'rgb(59 130 246 / 0.8)',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          // This ensures the gradient is only drawn when the chart area is fully available
          if (!chartArea) return 'rgba(59, 130, 246, 0.2)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        tension: 0.4, // Smoothing the line (monotone)
        borderWidth: 3,
        pointRadius: 0, // Hide points by default
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#3b82f6',
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(4px)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Sales: ₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 12, weight: '600' } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false, tickLength: 0 },
        border: { display: false, dash: [3, 3] }, // Dashed horizontal lines
        ticks: { color: '#94a3b8', font: { size: 12, weight: '600' }, callback: (value) => `₹${value / 1000}k`, padding: 10 },
      },
    },
  };

  return (
    <div className="relative space-y-6 min-h-full z-0 isolate w-full">
      
      {/* Added 'transform-gpu' to the heavy blur elements to force hardware acceleration */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-50 pointer-events-none -z-10 transform-gpu"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none -z-10 transform-gpu"></div>

      {/* Header Section */}
      <div className="relative flex justify-between items-end mb-8 z-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          {/* <p className="text-slate-500 font-medium mt-1">
            Welcome back to Inizio. You are logged in as <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded-md">{user?.role}</span>
          </p> */}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10">
        {metrics.map((metric, index) => (
          <div 
            key={index} 
            className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 cursor-pointer relative overflow-hidden group" 
            onClick={() => usernav(index)}
          >
            <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="relative flex items-center justify-between mb-4 z-10">
              <div className={`p-3.5 rounded-xl ${metric.bg}`}>
                <metric.icon className={`text-xl ${metric.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-400 text-sm font-bold tracking-wide">{metric.title}</h3>
              <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (Sales Chart) */}
      <div className="relative mt-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50 rounded-3xl p-6 sm:p-8 overflow-hidden z-10">
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative flex items-center justify-between mb-6 z-10">
          <h2 className="text-lg font-bold text-white">Electronics Sales Overview</h2>
        </div>
        <div className="relative h-80 w-full z-10">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;