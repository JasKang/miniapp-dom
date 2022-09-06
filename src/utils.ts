/**
 * 获取随机 id
 */
let seed = +new Date()

export function getId() {
  const charString = 'abcdefghij'
  const id = ++seed
  return id
    .toString()
    .split('')
    .map(item => charString[+item])
    .join('')
}
