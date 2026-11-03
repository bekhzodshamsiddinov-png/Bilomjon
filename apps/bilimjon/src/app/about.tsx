import { Linking, View } from 'react-native';
import { Btn, Card, Screen, Txt } from '../components/ui';
import { catalog } from '../data';
import { S } from '../theme';

export default function About() {
  const lessons = catalog.lessons.length;
  const topics = catalog.map.filter((m) => m.kind !== 'gap').length;
  return (
    <Screen>
      <Txt variant="h1" accessibilityRole="header">BILIM AI haqida</Txt>
      <Card style={{ gap: S.sm }}>
        <Txt variant="h3">Bu nima?</Txt>
        <Txt>
          1–4-sinf o‘quvchilari uchun o‘quv yordamchisi Bilimjon va ota-onalar uchun “qanday tushuntiraman” qo‘llanmasi. Maqsad — bola yangi masalani o‘zi, ishorasiz yecha olishi.
        </Txt>
      </Card>
      <Card style={{ gap: S.sm }}>
        <Txt variant="h3">Hozirgi holat — sinov versiyasi</Txt>
        <Txt>• Bilimjon haqiqiy sun’iy intellekt emas: u oldindan yozilgan, tekshiriladigan qoidalar bilan ishlaydi. Javoblarni faqat aniq hisoblovchi dastur tekshiradi.</Txt>
        <Txt>• Matematika: {topics} ta mavzu darsliklar (I.V. Repyova, «Novda Edutainment») mundarijasi bo‘yicha joylangan; {lessons} ta to‘liq dars (2-sinf, 3-chorak) AI metodist tomonidan yozilgan va o‘qituvchi tasdig‘ini kutmoqda.</Txt>
        <Txt>• Darslik matni yoki mashqlari ko‘chirilmagan — faqat mavzu nomlari. Mashqlar bizning o‘zimizniki.</Txt>
        <Txt>• Boshqa fanlar keyingi bosqichlarda qo‘shiladi.</Txt>
      </Card>
      <Card style={{ gap: S.sm }}>
        <Txt variant="h3">Maxfiylik</Txt>
        <Txt>• Ro‘yxatdan o‘tish yo‘q, hech qanday shaxsiy ma’lumot yig‘ilmaydi va saqlanmaydi. Ilova yopilganda natijalar o‘chadi.</Txt>
        <Txt>• Reklama, to‘lov va kuzatuv (analytics) yo‘q.</Txt>
        <Txt>• Ota-ona panelidagi raqamlar — namuna, haqiqiy bola natijalari emas.</Txt>
      </Card>
      <View style={{ gap: S.sm }}>
        <Btn kind="quiet" label="Manba kod (GitHub)" onPress={() => Linking.openURL('https://github.com/bekhzodshamsiddinov-png/Bilomjon')} />
      </View>
    </Screen>
  );
}
