//  importando apenas o Router e não todo o express;
import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import SupportController from './app/controllers/SupportController';
import SupportUserController from './app/controllers/SupportUserController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.put('/users', authMiddleware, UserController.update);
// STUDENTS AMBOS RECEBEM OS authMIDDLEWARE PARA AUTENTICAÇÃO
// STUDENTcONTROLLER VAI RECEBER UM ID VIA URL PARA FAZER O UPDATE NO STUDENT CERTO
routes.post('/students', authMiddleware, StudentController.store);
routes.put('/students/:id', authMiddleware, StudentController.update);

// PLAN
routes.post('/plans', authMiddleware, PlanController.store);
routes.put('/plans/:id', authMiddleware, PlanController.update);

// CADASTRO/REGISTRATION
routes.post('/registrations', authMiddleware, RegistrationController.store);
routes.get('/registrations', authMiddleware, RegistrationController.index);
routes.put('/registrations/:id', authMiddleware, RegistrationController.update);
routes.delete(
  '/registrations/:id',
  authMiddleware,
  RegistrationController.delete
);

// Checkins
routes.post('/students/:id/checkins', CheckinController.store);
routes.get('/students/:id/checkins', CheckinController.index);

// Perguntas / Estudantes
routes.post('/students/:student_id/help-orders', SupportController.store);
routes.get('/students/:student_id/help-orders', SupportController.index);

// respostas / Administradores
routes.put(
  '/help-orders/:id/answer',
  authMiddleware,
  SupportUserController.update
);
routes.get('/help-orders/answer', authMiddleware, SupportUserController.index);

export default routes;
