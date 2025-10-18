import os
import base64
import mimetypes
import subprocess
from typing import List
from datetime import datetime, date, timedelta

from fastapi import FastAPI
from pydantic import BaseModel

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# ---------------- Config ----------------
PEN_EMAIL = os.getenv('PEN_EMAIL', 'office@pen.com')
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS', 'your_email@example.com')
TOKEN_FILE = os.getenv('TOKEN_FILE', 'token.json')
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FINISHED_DIR = os.path.join(BASE_DIR, 'finished_noms')
os.makedirs(FINISHED_DIR, exist_ok=True)

MGO_TEMPLATE = os.getenv('MGO_TEMPLATE', os.path.join(BASE_DIR, 'mgo_nom_template.docx'))
IFO_TEMPLATE = os.getenv('IFO_TEMPLATE', os.path.join(BASE_DIR, 'ifo_nom_template.docx'))
BOTH_TEMPLATE = os.getenv('BOTH_TEMPLATE', os.path.join(BASE_DIR, 'mgo_ifo_nom_template.docx'))
LIBREOFFICE_PATH = os.getenv('LIBREOFFICE_PATH', r'C:\\Program Files\\LibreOffice\\program\\soffice.exe')


def authenticate():
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        return build('gmail', 'v1', credentials=creds)
    raise RuntimeError('No valid credentials found. Place token.json next to the app.')


def send_email(recipients, subject, body, attachments=None):
    service = authenticate()
    message = MIMEMultipart()
    message['To'] = ', '.join(recipients)
    message['Subject'] = subject
    message.attach(MIMEText(body, 'plain'))

    for file_path in attachments or []:
        if os.path.exists(file_path):
            filename = os.path.basename(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            main_type, sub_type = mime_type.split('/', 1)
            with open(file_path, 'rb') as f:
                part = MIMEBase(main_type, sub_type)
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={filename}')
            message.attach(part)

    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
    service.users().messages().send(userId='me', body={'raw': encoded_message}).execute()


def replace_and_format_run(run, old_string, new_string):
    if old_string in run.text:
        run.text = run.text.replace(str(old_string), str(new_string))
        run.font.name = 'Nunito'
        run._element.rPr.rFonts.set(qn('w:eastAsia'), 'Tahoma')
        run.font.size = Pt(9)


def replace_strings_in_docx(doc_path, output_path, replacements, save):
    doc = Document(doc_path)
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            for old_string, new_string in replacements.items():
                replace_and_format_run(run, old_string, new_string)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        for old_string, new_string in replacements.items():
                            replace_and_format_run(run, old_string, new_string)
    if save == 1:
        doc.save(output_path)


def get_bunker_date(value):
    if '-' in value:
        value = value.split('-')[1]
    value = value.split('.')
    return date(int(value[2]), int(value[1]), int(value[0]))


def convert_docx_to_pdf(input_path, output_path, librepath):
    if not input_path.endswith('.docx'):
        raise ValueError('Input file must be a .docx file.')
    if not output_path.endswith('.pdf'):
        raise ValueError('Output file must have a .pdf extension.')
    if not os.path.exists(input_path):
        raise FileNotFoundError(f'Template not found: {input_path}')

    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    command = [
        librepath,
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', output_dir,
        input_path,
    ]
    subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_path


def delete_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)


def process_both(vessel_name, vessel_imo, supply_dates, mgo_tons, mgo_price, ifo_tons, ifo_price, agent):
    global queued_up_files
    replacements = {
        'X1_CN': str('Simple Fuel FZCO').upper(),
        'X1_VSLN': str(vessel_name).upper(),
        'X1_IMO': vessel_imo,
        'X1_VSLSD': supply_dates,
        'X1_MQ': mgo_tons,
        'X1_MP': mgo_price - 2,
        'X1_IQ': ifo_tons,
        'X1_IP': ifo_price - 2,
        'X1_AGNT': agent,
    }
    replacements2 = {
        'X1_RN': str(get_bunker_date(replacements.get('X1_VSLSD')).strftime('%Y%m%d')) + '-NOM-' + str(replacements.get('X1_VSLN')).replace(' ', '_'),
        'X1_UC': 'USD',
        'X1_DDD': 30,
        'X1_DATE': get_bunker_date(replacements.get('X1_VSLSD')) - timedelta(days=10),
    }
    in_path = BOTH_TEMPLATE
    out_path = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.docx")
    replace_strings_in_docx(in_path, out_path, replacements, 1)
    replace_strings_in_docx(out_path, out_path, replacements2, 1)
    input_docx = out_path
    output_pdf = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.pdf")
    convert_docx_to_pdf(input_docx, output_pdf, LIBREOFFICE_PATH)
    delete_file(out_path)
    queued_up_files.append(output_pdf)


def process_mgo(vessel_name, vessel_imo, supply_dates, mgo_tons, mgo_price, agent):
    global queued_up_files
    replacements = {
        'X1_CN': str('Simple Fuel FZCO').upper(),
        'X1_VSLN': str(vessel_name).upper(),
        'X1_IMO': vessel_imo,
        'X1_VSLSD': supply_dates,
        'X1_MQ': mgo_tons,
        'X1_MP': mgo_price - 2,
        'X1_AGNT': agent,
    }
    replacements2 = {
        'X1_RN': str(get_bunker_date(replacements.get('X1_VSLSD')).strftime('%Y%m%d')) + '-NOM-' + str(replacements.get('X1_VSLN')).replace(' ', '_'),
        'X1_UC': 'USD',
        'X1_DDD': 30,
        'X1_DATE': get_bunker_date(replacements.get('X1_VSLSD')) - timedelta(days=10),
    }
    in_path = MGO_TEMPLATE
    out_path = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.docx")
    replace_strings_in_docx(in_path, out_path, replacements, 1)
    replace_strings_in_docx(out_path, out_path, replacements2, 1)
    input_docx = out_path
    output_pdf = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.pdf")
    convert_docx_to_pdf(input_docx, output_pdf, LIBREOFFICE_PATH)
    delete_file(out_path)
    queued_up_files.append(output_pdf)


def process_ifo(vessel_name, vessel_imo, supply_dates, ifo_tons, ifo_price, agent):
    global queued_up_files
    replacements = {
        'X1_CN': str('Simple Fuel FZCO').upper(),
        'X1_VSLN': str(vessel_name).upper(),
        'X1_IMO': vessel_imo,
        'X1_VSLSD': supply_dates,
        'X1_IQ': ifo_tons,
        'X1_IP': ifo_price - 2,
        'X1_AGNT': agent,
    }
    replacements2 = {
        'X1_RN': str(get_bunker_date(replacements.get('X1_VSLSD')).strftime('%Y%m%d')) + '-NOM-' + str(replacements.get('X1_VSLN')).replace(' ', '_'),
        'X1_UC': 'USD',
        'X1_DDD': 30,
        'X1_DATE': get_bunker_date(replacements.get('X1_VSLSD')) - timedelta(days=10),
    }
    in_path = IFO_TEMPLATE
    out_path = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.docx")
    replace_strings_in_docx(in_path, out_path, replacements, 1)
    replace_strings_in_docx(out_path, out_path, replacements2, 1)
    input_docx = out_path
    output_pdf = os.path.join(FINISHED_DIR, f"{replacements2['X1_RN']}.pdf")
    convert_docx_to_pdf(input_docx, output_pdf, LIBREOFFICE_PATH)
    delete_file(out_path)
    queued_up_files.append(output_pdf)


app = FastAPI()

class get_nom_info(BaseModel):
    vessel_name: str
    vessel_imo: int
    vessel_port: str
    mgo_tons: str
    mgo_price: float
    ifo_tons: str
    ifo_price: float
    vessel_supply_date: str
    vessel_trader: str
    vessel_agent: str


@app.get('/')
def root():
    return {'msg': 'Welcome to the API'}


def process_noms(full_vessel_data):
    global queued_up_files
    queued_up_files = []

    if (full_vessel_data['mgo_tons'] != '0') and (full_vessel_data['ifo_tons'] == '0'):
        process_mgo(
            vessel_name=full_vessel_data['vessel_name'],
            vessel_imo=full_vessel_data['vessel_imo'],
            supply_dates=full_vessel_data['vessel_supply_date'],
            mgo_tons=full_vessel_data['mgo_tons'],
            mgo_price=full_vessel_data['mgo_price'],
            agent=full_vessel_data['vessel_agent'],
        )
    elif (full_vessel_data['mgo_tons'] == '0') and (full_vessel_data['ifo_tons'] != '0'):
        process_ifo(
            vessel_name=full_vessel_data['vessel_name'],
            vessel_imo=full_vessel_data['vessel_imo'],
            supply_dates=full_vessel_data['vessel_supply_date'],
            ifo_tons=full_vessel_data['ifo_tons'],
            ifo_price=full_vessel_data['ifo_price'],
            agent=full_vessel_data['vessel_agent'],
        )
    elif (full_vessel_data['mgo_tons'] != '0') and (full_vessel_data['ifo_tons'] != '0'):
        process_both(
            vessel_name=full_vessel_data['vessel_name'],
            vessel_imo=full_vessel_data['vessel_imo'],
            supply_dates=full_vessel_data['vessel_supply_date'],
            mgo_tons=full_vessel_data['mgo_tons'],
            mgo_price=full_vessel_data['mgo_price'],
            ifo_tons=full_vessel_data['ifo_tons'],
            ifo_price=full_vessel_data['ifo_price'],
            agent=full_vessel_data['vessel_agent'],
        )

    fetched_email_body = (
        f"Dear Simple Fuel FZCO,\n\nKindly find the below attached nomination for the vessel:\n\n"
        f"- mv {full_vessel_data['vessel_name']} : IMO {full_vessel_data['vessel_imo']} : supply on {full_vessel_data['vessel_supply_date']}\n\n"
        f"Warm regards"
    )
    fetched_email_subject = f"NOMINATION FOR VESSEL: {full_vessel_data['vessel_name']} (IMO: {full_vessel_data['vessel_imo']})"
    send_email(recipients=[PEN_EMAIL], subject=fetched_email_subject, body=fetched_email_body, attachments=queued_up_files)


@app.post('/endpoint1')
def endpoint1(item: get_nom_info):
    nomination_data = {
        'vessel_name': str(item.vessel_name),
        'vessel_imo': int(item.vessel_imo),
        'vessel_port': str(item.vessel_port),
        'mgo_tons': str(item.mgo_tons),
        'mgo_price': float(item.mgo_price),
        'ifo_tons': str(item.ifo_tons),
        'ifo_price': float(item.ifo_price),
        'vessel_supply_date': str(item.vessel_supply_date),
        'vessel_trader': str(item.vessel_trader),
        'vessel_agent': str(item.vessel_agent),
    }
    process_noms(nomination_data)
    return {'ok': True}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)


