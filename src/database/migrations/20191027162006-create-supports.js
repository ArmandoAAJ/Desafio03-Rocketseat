module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('supports', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: 'students', key: 'id' },
        allowNull: true,
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      answer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      answer_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('supports');
  },
};
