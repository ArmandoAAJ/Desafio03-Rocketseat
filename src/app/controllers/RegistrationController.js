import * as Yup from 'yup';
import { parseISO, isBefore, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import '../../config/mail';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';
import RegisterMail from '../jobs/RegisterMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validaçaão Falhou' });
    }

    const { start_date, plan_id, student_id } = req.body;
    // Busca um Estudante/Aluno com o id informado para cadastro que tenha uma inscrição Nula
    // Ou seja se isso for verdade o estudante já tem uma matricula em aberto
    const registration = await Registration.findOne({
      where: { student_id, canceled_at: null },
    });
    if (registration) {
      return res
        .status(400)
        .json({ error: 'Estudante/Aluno possui matricula em aberto' });
    }
    // Verifica se o plano existe
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }
    // Verifica se o Estudante/Aluno existe
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Estudante/Aluno não encontrado' });
    }
    // Verifica se a data escolhida pelo Estudante/Aluno está anterior a data atual
    const start = parseISO(start_date);
    if (isBefore(start, new Date())) {
      return res.status(400).json({ error: 'Data desatualizada' });
    }
    // Calcula a data final com base no plano escolhido(1 mes, 3 meses, 6 meses)
    const end = addMonths(start, plan.duration);
    // Calcula o valor conforme o numero de meses escolhido
    const price = plan.price * plan.duration;

    const { id } = await Registration.create({
      user_id: req.userId,
      student_id: student.id,
      plan_id: plan.id,
      start_date: start,
      end_date: end,
      final_price: price,
    });
    const formatStart = format(start, "'Dia' dd 'de' MMMM yyyy", {
      locale: pt,
    });
    const formatEnd = format(end, "'Dia' dd 'de' MMMM yyyy", {
      locale: pt,
    });
    // Envia esses dados para a fila que vai processar os emails separadamente
    await Queue.add(RegisterMail.key, {
      student,
      plan,
      formatStart,
      formatEnd,
      price,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      formatStart,
      formatEnd,
      price,
    });
  }

  async index(req, res) {
    // Busca os registros dos Alunos/Estudantes ordena pela data de Criação e retorna alguns dados
    // de cada Model que tem ligação com a tabela Registration
    const register = await Registration.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['start_date'],
      attributes: ['id', 'start_date', 'end_date', 'final_price'],
      include: [
        {
          model: Plan,
          attributes: ['id', 'title', 'duration', 'price'],
        },
        {
          model: Student,
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return res.json(register);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validação Falhou',
      });
    }
    const { plan_id, start_date } = req.body;

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Aluno/Estudante nao econtrado' });
    }
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plano nao econtrado' });
    }
    const titlePlan = plan.title;

    // Verifica se a data escolhida pelo Estudante/Aluno está anterior a data atual
    const start = parseISO(start_date);
    if (isBefore(start, new Date())) {
      return res.status(400).json({ error: 'Data desatualizada' });
    }
    // Calcula a data final com base no plano escolhido(1 mes, 3 meses, 6 meses)
    const end = addMonths(start, plan.duration);
    // Calcula o valor conforme o numero de meses escolhido
    const price = plan.price * plan.duration;

    const register = await Registration.findOne({
      where: { student_id: student.id, canceled_at: null },
    });
    if (!register) {
      return res.status(400).json({
        error: 'Estudante/Aluno não possue cadastro para ser Atualizado',
      });
    }

    const { id, student_id } = await register.update({
      user_id: req.userId,
      plan_id: plan.id,
      start_date: start,
      end_date: end,
      final_price: price,
    });

    return res.json({ id, student_id, titlePlan, start, end, price });
  }

  async delete(req, res) {
    const student = req.params;
    if (!student) {
      return res.status(400).json({ error: 'Estudante/Aluno não existe' });
    }

    const register = await Registration.findOne({
      where: { student_id: student.id, canceled_at: null },
    });

    if (!register) {
      return res.status(400).json({
        error: 'Estudante/Aluno não possue cadastro para ser cancelado',
      });
    }

    register.canceled_at = new Date();
    await register.save({
      user_id: req.userId,
    });

    return res.json(register);
  }
}

export default new RegistrationController();
