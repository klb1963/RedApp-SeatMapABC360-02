import express from 'express';
import axios from 'axios';
import { buildUpdateReservationRQ } from '../utils/buildUpdateReservationRQ';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { sessionToken, seatAssignments } = req.body;

    const xmlPayload = buildUpdateReservationRQ(seatAssignments);

    const response = await axios.post(
      'https://webservices.sabre.com/websvc', // ❗️Проверь: актуальный endpoint от Sabre
      xmlPayload,
      {
        headers: {
          'Content-Type': 'text/xml',
          'Authorization': `Bearer ${sessionToken}`
        }
      }
    );

    res.status(200).send({ xml: response.data });

  } catch (error) {
    console.error('❌ UpdateReservationRQ failed:', error);
    res.status(500).send({ error: 'UpdateReservationRQ failed', details: error.message });
  }
});

export default router;