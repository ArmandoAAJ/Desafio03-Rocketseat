import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validação Falhou',
      });
    }

    const studentExist = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExist) {
      return res.status(400).json({ error: 'Usuário Existente' });
    }
    const student = await Student.create(req.body);
    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validação Falhou',
      });
    }
    //  ID VIRÁ VIA URL
    const { id } = req.params;

    const student = await Student.findByPk(id);

    // IMPEDE DE EDITAR UM USUARIO QUE NAO EXISTE
    if (!student) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    //  TESTA SE O EMAIL FOI ALTERADO E GARANTE QUE NAO VENHA COMO VAZIO
    //  POREM CASO NAO TIVER EMAIL ELE ASSUME O EMAIL JÁ CADASTRADO
    if (req.body.email !== student.email && req.body.email !== undefined) {
      const studentExist = await Student.findOne({
        where: { email: req.body.email },
      });
      if (studentExist) {
        return res.status(400).json({ error: 'Usuário Existente' });
      }
    }

    const { name, email, age, weight, height } = await student.update(req.body);
    // RETORNO TODOS OS DADOS PQ ACREDITO QUE VÃO SER TODOS IMPORTANTES
    // POREM NÃO SEI QUAL A MELHOR PRÁTICA
    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }
}

export default new StudentController();
