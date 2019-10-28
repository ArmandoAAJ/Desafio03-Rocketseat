import * as Yup from 'yup';
import Student from '../models/Student';
import Support from '../models/Support';

class SupportController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validaçaão Falhou' });
    }

    const { student_id } = req.params;
    const { question } = req.body;

    // Verifica se o aluno existe
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Aluno/Estudante não existe' });
    }

    // Busca o aluno e ve se ele já nao tem um pergunta em aberto
    const support = await Support.findOne({
      where: { student_id, answer: null },
    });

    if (support) {
      return res
        .status(400)
        .json({ error: 'Aluno/Estudante já tem uma pergunta em aberto' });
    }

    const { id } = await Support.create({
      student_id,
      question,
    });

    return res.json({
      id,
      student_id,
      question,
    });
  }

  async index(req, res) {
    const { student_id } = req.params;

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Aluno/Estudante não existe' });
    }

    const support = await Support.findAll({
      where: { student_id },
      order: [['id', 'DESC']],
    });

    return res.json(support);
  }
}

export default new SupportController();
