import '../../config/mail';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { answer, question, name, email } = data;
    console.log('A fila executou');
    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'answer',
      context: {
        name,
        question,
        answer,
      },
    });
  }
}

export default new AnswerMail();
