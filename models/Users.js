const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.STRING(36),
        defaultValue: () => uuidv4(),
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [2, 255],
                msg: "Password must be at least 4 characters long"
            }
        }
    }
}, {
    timestamps: true,
    tableName: "Users",
    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
        }
    }
});

module.exports = User;
