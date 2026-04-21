import { doc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { TestAttempt, TestData } from "../types";

export async function getSavedTests(): Promise<TestData[]> {
  const user = auth.currentUser;
  if (!user) {
    const data = localStorage.getItem("ai_tests");
    return data ? JSON.parse(data) : [];
  }

  const q = query(collection(db, "tests"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TestData);
}

export async function saveTest(test: TestData) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "tests", test.id), { ...test, userId: user.uid });
  } else {
    const tests = await getSavedTests();
    tests.push(test);
    localStorage.setItem("ai_tests", JSON.stringify(tests));
  }
}

export async function getSavedAttempts(): Promise<TestAttempt[]> {
  const user = auth.currentUser;
  if (!user) {
    const data = localStorage.getItem("ai_test_attempts");
    return data ? JSON.parse(data) : [];
  }

  const q = query(collection(db, "attempts"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TestAttempt);
}

export async function saveAttempt(attempt: TestAttempt) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "attempts", attempt.id), { ...attempt, userId: user.uid });
  } else {
    const attempts = await getSavedAttempts();
    attempts.push(attempt);
    localStorage.setItem("ai_test_attempts", JSON.stringify(attempts));
  }
}
