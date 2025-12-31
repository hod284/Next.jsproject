import bcrypt from 'bcrypt';

const SALT_ROUNDS =10;
/** 
*비밀번호 해싱
*@param   password -평문 비밀번호
*@return- 일치 여부
*/ 
// Promise는 자바 비동기 결과 값 받기
export async function hashPassword(password : string) : Promise <string>{
    return bcrypt.hash(password,SALT_ROUNDS);
}
/**
 * 비밀번호 검증
 * @param password -평문 비밀 번호
 * @param hashedPassword - 해싱된 비밀번호
 * @return- 일치 여부
 */
// Promise는 자바 비동기 결과 값 받기
export async function verifyPassword(password :string, hashedPassword : string): Promise<boolean> {
    return bcrypt.compare(password,hashedPassword);
}
/**
 * 비밀번호 유효성 검증
 * @param password - 검증할 비밀번호
 * @return 유효성 검사 결과
 */
/*
TypeScript 함수의 “반환 타입을 객체로 명시”하는 문법
export function 함수이름(매개변수: 타입): 반환타입
*/
export function  validdatePassword(password : string):{   valid: boolean; error? : string; }
{
    if(!password)
    {
        return {valid :false , error :'비밀번호는 필수 입니다'};
    }
    if(password.length <8)
    {
        return {valid :false ,error: '비밀번호가 최소 8자리 이상이어야 합니다' };
    }
    if (password.length > 100) {
       return { valid: false, error: '비밀번호는 100자를 초과할 수 없습니다' };
    }
    // 영문, 숫자 포함 체크(선택사항)
    const hasletter =/[a-zA-Z]/.test(password);
    const hasNumber =/[0-9]/.test(password);
    if(!hasNumber||! hasletter)
    {
        return {valid : false , error :'영문 숫자를 혼합해주세요'};
    }

    return {valid : true};
}
