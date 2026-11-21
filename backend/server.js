const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const employerRoutes = require('./routes/employerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const savedOpportunityRoutes = require('./routes/savedOpportunityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-opportunities', savedOpportunityRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    success: true,
    service: 'E-DIL Ethiopia API',
    status: 'ok',
    database: process.env.MONGODB_URI ? 'configured' : 'not_configured',
    timestamp: new Date().toISOString(),
  });
});

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: 'The requested API route was not found.',
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred.',
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`E-DIL Ethiopia API listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
