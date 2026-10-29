
import streamlit as st

st.set_page_config(
    page_title="Student Result Management System",
    layout="wide"
)

st.title("Student Result Management System")
st.subheader("Enter Student Details")

with st.form("student_form"):
    name = st.text_input("Student Name")
    roll_no = st.text_input("Roll Number")

    st.write("Enter marks for three subjects")

    col1, col2, col3 = st.columns(3)

    with col1:
        subject1 = st.number_input(
            "Subject 1 Marks", min_value=0, max_value=100, value=0
        )

    with col2:
        subject2 = st.number_input(
            "Subject 2 Marks", min_value=0, max_value=100, value=0
        )

    with col3:
        subject3 = st.number_input(
            "Subject 3 Marks", min_value=0, max_value=100, value=0
        )

    submitted = st.form_submit_button("Calculate Result")

if submitted:
    if not name.strip() or not roll_no.strip():
        st.error("Student name and roll number are required.")
    else:
        total = subject1 + subject2 + subject3
        percentage = total / 3

        if percentage >= 90:
            grade = "A+"
        elif percentage >= 80:
            grade = "A"
        elif percentage >= 70:
            grade = "B"
        elif percentage >= 60:
            grade = "C"
        elif percentage >= 40:
            grade = "D"
        else:
            grade = "Fail"

        st.success("Student result calculated successfully!")

        st.subheader("Student Result")
        st.write("Student Name:", name)
        st.write("Roll Number:", roll_no)
        st.write("Total Marks:", total, "/ 300")
        st.write(f"Percentage: {percentage:.2f}%")
        st.write("Grade:", grade)
