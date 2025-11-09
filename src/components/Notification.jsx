const Notification = ({ message, type, onClose }) => {
  const baseStyle =
    'p-4 rounded-lg shadow-md mb-4 flex justify-between items-center'
  let colorStyle = ''

  switch (type) {
    case 'success':
      colorStyle = 'bg-green-100 border-l-4 border-green-500 text-green-700'
      break
    case 'error':
      colorStyle = 'bg-red-100 border-l-4 border-red-500 text-red-700'
      break
    default:
      colorStyle = 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
  }

  return (
    <div className={`${baseStyle} ${colorStyle}`}>
      <span>{message}</span>
      <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
        <X size={18} />
      </button>
    </div>
  )
}

export default Notification
