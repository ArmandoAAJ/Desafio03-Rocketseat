import { startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import Registration from '../models/Registration';
import Checkin from '../models/Checkin';

class CheckinContrller {
  async store(req, res) {
    const { id } = req.params;
    // pega a data atual
    const start = new Date();
    // pega a data atual e seta - 7 dias com a hora 00:00:00
    const startWeek = startOfWeek(start);
    // pega a data atual e seta ela mesmo com a hora 23:59:59
    const endWeek = endOfWeek(start);

    // se na tabela registro estudante tiver com o plano canceled_at
    // setado quer dizer que ele nao tem um plano ativo
    const student = await Registration.findOne({
      where: { student_id: id, canceled_at: null },
    });

    if (!student) {
      return res.status(400).json({ error: 'Você não possui plano ativo' });
    }

    // Busca na tabela checkin os 5 ultimos registro pela data do dia
    // Para garantir os ultimos retorna em ordem decrscente, sempre o ultimo ID
    // será considerado o maior
    const checkins = await Checkin.findAll({
      where: {
        student_id: id,
        created_at: {
          [Op.between]: [startWeek, endWeek],
        },
      },
      limit: 5,
      order: [['id', 'DESC']],
    });

    // Se os ultimos regstros da semana for maior ou igual a 5 ele excedeu o limite de
    // uso por semana
    if (checkins.length >= 5) {
      return res
        .status(400)
        .json({ error: 'Excedeu  número limite de checkins por semana' });
    }

    await Checkin.create({
      student_id: id,
      created_at: start,
    });

    return res.json({
      id,
      start,
    });
  }

  async index(req, res) {
    const { id } = req.params;

    // Busca os 5 ultimos checkins e mostra para o usuario
    const checkins = await Checkin.findAll({
      where: { student_id: id },
      limit: 5,
      order: [['id', 'DESC']],
    });

    // Se checkins voltar com o tamanho 0 quer dizer que nao tem checkins do id informado
    if (checkins.length === 0) {
      return res.status(400).json({ error: 'Não há checkin deste usuário' });
    }

    return res.json(checkins);
  }
}

export default new CheckinContrller();
