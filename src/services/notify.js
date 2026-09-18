import { notification } from 'ant-design-vue'

// Сообщения от AuthService.js / сервисов сущностей — см. NUTRIFLOW_BACKEND.
const SERVER_ERROR = {
  'email is invalid': 'Некорректный email или такого пользователя не существует',
  'password is invalid': 'Неверный пароль',
  'password is null': 'У этого аккаунта не задан пароль',
  'email is already registered': 'Пользователь с таким email уже зарегистрирован',
  'password must be at least 6 characters': 'Пароль должен быть не короче 6 символов',
  'user is blocked': 'Пользователь заблокирован',
  'No token was sent': 'Сессия истекла, войдите заново',
  'Authentication failed! No such user': 'Сессия истекла, войдите заново'
}

export const notifyServerError = (serverMessage, duration) => {
  notification.error({
    message: 'Ошибка сервера',
    description: SERVER_ERROR[serverMessage] || serverMessage,
    duration: duration ?? 5
  })
}

export const notifyError = (msg, duration) => {
  notification.error({
    message: 'Ошибка',
    description: msg,
    duration: duration ?? 5
  })
}

export const notifyServerSuccess = (title, msg, duration) => {
  notification.success({
    message: title,
    description: msg,
    duration: duration ?? 4
  })
}
