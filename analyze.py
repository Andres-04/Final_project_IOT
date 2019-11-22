# Abrir un archivo de audio .wav
import numpy as np
import matplotlib
matplotlib.use('pdf')
import matplotlib.pyplot as plt
import scipy.io.wavfile as waves
import sys
matplotlib.rcParams['figure.dpi'] = 300
# def main():
# INGRESO 
#archivo = input('archivo de sonido:' )
archivo = sys.argv[1]
# lat = sys.argv[2]
# lon = sys.argv[3]
# archivo = "test"
muestreo, sonido = waves.read("/home/pi/html/recordings/"+archivo + ".wav")

# PROCEDIMIENTO
tamano=np.shape(sonido)
canales=len(tamano)
tipo = 'stereo'
if (canales<2):
    tipo = 'mono'
duracion = len(sonido) /muestreo

# SALIDA
# print('muestreo (Hz) : ',muestreo)
# print('canales: ' + str(canales) + ' tipo ' + tipo )
# print('duracion (s): ',duracion)
# print('size de matriz: ', tamano)


plt.plot(sonido)

plt.savefig(fname="/home/pi/html/recordings/"+archivo+'.png')
# plt.savefig(fname="/home/pi/html/recordings/"+archivo+'.pdf')

print("%s" %(np.average(np.abs(sonido))))
# print("%s, %s, %s" %((np.average(np.abs(sonido))), lat, lon))

# return (np.average(np.abs(sonido))), lat, lon
  
# if __name__== "__main__":
#   main()

