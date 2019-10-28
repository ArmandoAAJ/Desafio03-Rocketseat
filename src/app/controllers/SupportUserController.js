import * as Yup from 'yup';
import Support from '../models/Support';
import Student from '../models/Student';
import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class SupportUserController {
  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validaçaão Falhou' });
    }

    // Busca o Id e procura ver se tem essa pergunta
    const { id } = req.params;
    const { answer } = req.body;

    const support = await Support.findOne({
      where: { id },
    });

    if (!support) {
      return res.status(400).json({ error: 'Pergunta não enontrada' });
    }
    if (support.answer !== null) {
      return res.status(400).json({ error: 'Essa pergunta Já foi respondida' });
    }

    // Atualiza a questao e a data da resposta e retorna a pergunta e o id do estudante
    const { question, student_id } = await support.update({
      answer,
      answer_at: new Date(),
    });

    // Busca os dados do estudante
    const { name, email } = await Student.findOne({
      where: { id: student_id },
    });

    // Manda para a fila processar os email
    await Queue.add(AnswerMail.key, {
      name,
      email,
      question,
      answer,
    });

    return res.json({
      id,
      student_id,
      question,
      answer,
    });
  }

  async index(req, res) {
    const support = await Support.findAll({
      where: { answer: null },
      order: [['id', 'ASC']],
    });

    return res.json(support);
  }
}

export default new SupportUserController();
