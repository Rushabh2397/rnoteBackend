import bcrypt from 'bcrypt'

export const encrypt = (password) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

export const decrypt = (password,hash)=>{
    const result = bcrypt.compareSync(password, hash); 
    return result
}

