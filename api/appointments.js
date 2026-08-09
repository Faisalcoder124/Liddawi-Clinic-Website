import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { patient_name, email, phone, service, doctor, date, time, notes, status } = req.body;
      if (!patient_name || !email || !phone || !service || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { data, error } = await supabase
        .from('appointments')
        .insert({ patient_name, email, phone, service, doctor, date, time, notes, status: status || 'pending' })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status, doctor, date, time, notes } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const updates = {};
      if (status) updates.status = status;
      if (doctor) updates.doctor = doctor;
      if (date) updates.date = date;
      if (time) updates.time = time;
      if (notes !== undefined) updates.notes = notes;
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body || req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('appointments api error', err);
    return res.status(500).json({ error: err.message });
  }
}
