import json 

from flask import Blueprint, render_template, url_for, flash, redirect, request, current_app
from flask_login import current_user, login_required
from flask_socketio import send, emit
from app import db, sio
from app.models import User, Game, Company, Facility, Generator, City, FacilityType, GeneratorType, PowerType
from app.models import FacilitySchema, GeneratorSchema

gamesio = Blueprint('gamesio', __name__)

@sio.on('connect')
def on_connect():
  # print("sid = ", sid)
  company = Company.query.filter_by(id=current_user.current_company).first()
  emit('game_connect', {'p_num': company.player_number, 'g_num': company.id_game})
  print('Message: Client connected')

@sio.on('disconnect')
def on_disconnect():
  print("disconnected from server.")
  # company = Company.query.filter_by(id=current_user.current_company).first()


@sio.on('message')
def on_message(msg):
  print("Message: ", msg)

# ###############################################################################  
#
# ###############################################################################
@sio.on('new_facility')
def on_new_facility(data):
  data = json.dumps(data)
  print("+"*80)
  print(f"data = {data}")

  data = json.loads(data)
  print("+"*80)
  print(f"data = {data}")

  company = Company.query.filter_by(id_user=current_user.id, id_game=data['gid']).first()
  facility = Facility(
    id_type=9, 
    id_game=data['gid'], 
    id_company=company.id, 
    player_number=company.player_number,
    row=data['row'], 
    column=data['column']
  )
  db.session.add(facility)
  db.session.commit()
  facility_schema = FacilitySchema()
  facility_serialized = facility_schema.dump(facility).data
  emit('new_facility', facility_serialized, namespace='/game'+ str(data['gid']))

  return (facility_serialized)

# ###############################################################################  
#
# ###############################################################################
@sio.on('cancel_facility')
def on_cancel_facility(data):
  pass 


 


# @sio.on('player_disconnect')
# def player_disconnect():
#   company = Company.query.filter_by(id=current_user.current_company).first()
#   company.connected_to_game = 0
#   db.session.commit()
  # print("Message: Player, ", company.player_number, " disconnected.")

# @sio.on('player_connect')
# def player_connect():
#   company = Company.query.filter_by(id=current_user.current_company).first()
#   company.connected_to_game = 1
#   db.session.commit()
  # print("Message: Player, ", company.player_number, " connected.")


@sio.on('player_build_facility')
def build_facility(facility):
  None

@sio.on('player_turn_button')
def player_next_turn():
  None