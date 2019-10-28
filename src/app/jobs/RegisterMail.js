import '../../config/mail';
import Mail from '../../lib/Mail';

class RegisterMail {
  get key() {
    return 'RegisterMail';
  }

  async handle({ data }) {
    const { student, plan, formatStart, formatEnd, price } = data;
    console.log('A fila executou');
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Cadastro realizado com sucesso',
      template: 'register',
      context: {
        student: student.name,
        plan: plan.title,
        start: formatStart,
        end: formatEnd,
        planDuration: plan.duration,
        planPrice: plan.price,
        pricef: price,
      },
    });
  }
}

export default new RegisterMail();
