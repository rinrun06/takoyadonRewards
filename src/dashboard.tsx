import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://opsihsjyxawieejmyfhv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc2loc2p5eGF3aWVlam15Zmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODE4NjYsImV4cCI6MjA3Njc1Nzg2Nn0.Sg4rxV2wKDojvyyQeHe5-lMM-bKOUBipOuckeGBblZY'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchDashboard() {
  const tableBody = document.getElementById('dashboard-body');

  try {
    const { data, error } = await supabase.rpc('get_customer_dashboard_data');

    if (error) {
      console.error('Error fetching dashboard:', error);
      tableBody.innerHTML = `<tr><td colspan="3">Error loading data</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">No data available</td></tr>`;
      return;
    }

    // Populate table
    tableBody.innerHTML = '';
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.id}</td><td>${row.name}</td><td>${row.points}</td>`;
      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    tableBody.innerHTML = `<tr><td colspan="3">Unexpected error</td></tr>`;
  }
}

// Fetch data on load
fetchDashboard();
